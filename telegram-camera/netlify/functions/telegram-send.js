// خواندن توکن و Chat ID از متغیرهای محیطی Netlify
// مقادیر جایگذاری شده شما در اینجا:
// BOT_TOKEN: 8453246503:AAGWST4Fj3acLPc2ymQO9DDLbn5VgS7sJSk
// CHAT_ID: 8457265216
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN; 
const TELEGRAM_CHAT_ID = process.env.CHAT_ID; 

const fetch = require('node-fetch');
const FormData = require('form-data');
const { URLSearchParams } = require('url'); // برای اطمینان از سازگاری

// تابع هندلر اصلی Netlify Function
exports.handler = async (event) => {
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
        };
    }
    
    // اگر توکن یا آیدی تعریف نشده باشد (در محیط Netlify)
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
         return {
            statusCode: 500,
            body: JSON.stringify({ ok: false, error: 'Telegram credentials missing (Set BOT_TOKEN and CHAT_ID in Netlify environment variables).' })
        };
    }
    
    try {
        const requestBody = event.body;
        const contentType = event.headers['content-type'];
        
        // اگر بدنه درخواست کدگذاری شده باشد (بیس ۶۴)، آن را دیکد می‌کنیم.
        const bodyBuffer = event.isBase64Encoded ? Buffer.from(requestBody, 'base64') : requestBody;
        
        // ساختن یک FormData جدید با داده‌های دریافتی از مرورگر
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHAT_ID);
        // ارسال فایل به عنوان 'photo'
        form.append('photo', bodyBuffer, {
            contentType: contentType.split(';')[0].trim(),
            filename: 'photo.jpeg' 
        });

        const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        
        const telegramResponse = await fetch(TELEGRAM_URL, {
            method: 'POST',
            body: form
        });
        
        const result = await telegramResponse.json();
        
        if (result.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ ok: true, message: 'Photo sent successfully.' })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ ok: false, error: result.description || 'Telegram API Error' })
            };
        }

    } catch (error) {
        console.error('Netlify Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ ok: false, error: 'Internal Server Error.' })
        };
    }
};