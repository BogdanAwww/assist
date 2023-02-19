import { PromoCodeTemplateModel } from "@/server/schema/entities/PromoCodeTemplateTC";

export const version = 3;

export default async function() {
    await PromoCodeTemplateModel.updateOne(
        {name: 'telegram-signup'},
        {
            name: 'telegram-signup',
            prefix: 'a70',
            type: 'subscription',
            descriptions: {
                ru: '3 месяца подписки «Premium» со скидкой 70%.'
            },
            data: {
                level: 'premium',
                multiplier: 3,
                discount: 0.3
            }
        },
        {upsert: true}
    );
    return true;
}
