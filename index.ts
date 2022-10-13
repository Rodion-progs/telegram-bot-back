const TelegramBot = require('node-telegram-bot-api');
import express from 'express';
import cors from 'cors';
import { Message } from "node-telegram-bot-api";
import * as dotenv from 'dotenv'
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const webAppUrl = 'https://master--cosmic-swan-84c411.netlify.app/'

const token = process.env.TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.on('message', async (msg: Message) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму',{
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: { url: webAppUrl + 'form' }}]
                ]
            }
        });

        await bot.sendMessage(chatId,'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: { url: webAppUrl }}]
                ]
            }
        });
    }

    const data = msg?.web_app_data?.data

    if (data) {
        try {
            const dataJson = JSON.parse(data);

            await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
            await bot.sendMessage(chatId, 'Ваша страна ' + dataJson?.country);
            await bot.sendMessage(chatId, 'Ваша улица ' + dataJson?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000)
        } catch (e) {
            console.error(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешный успех',
            input_message_content: { message_text: 'Поздравляем вы приобрели товаров на ' + totalPrice + 'руб.'}
        });
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Неуспешный успех',
            input_message_content: { message_text: 'Не удалось'}
        });
        return res.status(500).json({});
    }
});
