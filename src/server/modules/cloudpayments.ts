import {ClientService, TaxationSystem, ResponseCodes} from 'cloudpayments';
import express from 'express';
import config from '../config';
import {InvoiceModel} from '../schema/entities/InvoiceTC';
import {UserModel} from '../schema/entities/UserTC';
import billing from './billing';

const client = new ClientService({
	privateKey: config.cloudpayments.secret,
	publicId: config.cloudpayments.id,
	org: {
		taxationSystem: TaxationSystem.GENERAL,
		inn: 123456789
	}
});

const handlers = client.getNotificationHandlers();

export default async (req, res: express.Response) => {
	if (req.url == '/cloudpayments/check') {
		handlers
			.handleCheckRequest(req, async (request) => {
				const user = await UserModel.findOne({_id: request.AccountId});
				if (!user) {
					return ResponseCodes.INVALID_ACCOUNT_ID;
				}
				const invoice = await InvoiceModel.findOne({user: request.AccountId, id: request.InvoiceId});
				if (!invoice) {
					return ResponseCodes.UNKNOWN_INVOICE_ID;
				}
				const invoiceData = invoice.get('data');
				if (!invoiceData || Number(request.Amount) !== invoiceData.priceKZT) {
					return ResponseCodes.INVALID_AMOUNT;
				}
				return ResponseCodes.SUCCESS;
			})
			.then((data) => {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(data.response));
			})
			.catch(() => {
				res.end();
			});
	}

	if (req.url == '/cloudpayments/pay') {
		handlers
			.handlePayRequest(req, async (request) => {
				billing.successPay(request.InvoiceId);
				return ResponseCodes.SUCCESS;
			})
			.then((data) => {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(data.response));
			})
			.catch(() => {
				res.end();
			});
	}
};
