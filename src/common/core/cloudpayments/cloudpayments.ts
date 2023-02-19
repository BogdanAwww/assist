import config from '@/web/config';
import store from '@/web/state/store';

class CloudPayments {
	pay(invoiceId: string, amount: number): Promise<any> {
		const cp = window['cp'];
		const widget = new cp.CloudPayments();
		const viewer = store.getState().viewer;
		const cloudpaymentId = config.cloudpaymentId;
		if (!viewer || !cloudpaymentId) {
			throw new Error('not authorized');
		}
		return new Promise((resolve, reject) => {
			widget.pay(
				'auth',
				{
					publicId: cloudpaymentId,
					description: 'Оплата подписки в Assist',
					amount,
					currency: 'KZT',
					invoiceId,
					accountId: viewer._id,
					email: viewer.email,
					skin: 'mini'
					// data: {
					//     myProp: 'myProp value'
					// }
				},
				{
					onSuccess: function (_options) {
						// console.log(_options);
						resolve(undefined);
					},
					onFail: function (_reason, _options) {
						// console.log(_reason, _options);
						reject();
					},
					onComplete: function (_paymentResult, _options) {
						//Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
						// console.log(_paymentResult, _options);
					}
				}
			);
		});
	}
}

const cloudpayments = new CloudPayments();

export default cloudpayments;
