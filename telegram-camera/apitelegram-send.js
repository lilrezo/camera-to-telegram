// توکن و Chat ID شما
// !!! این اطلاعات در این فایل امن هستند زیرا در سمت سرور اجرا می‌شود !!!
const TELEGRAM_BOT_TOKEN = '8453246503:AAGWST4Fj3acLPc2ymQO9DDLbn5VgS7sJSk'; 
const TELEGRAM_CHAT_ID = '8457265216'; 

const fetch = require('node-fetch');
const FormData = require('form-data');

// تابع کمکی برای خواندن داده های خام multipart/form-data
function buffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('error', reject);
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

// تابع اصلی Serverless
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method Not Allowed' });
        return;
    }
    
    try {
        // خواندن داده‌های ورودی (شامل فایل)
        const requestBody = await buffer(req);
        
        // ساختن یک FormData جدید با داده‌های دریافتی از مرورگر
        const form = new FormData();
        form.append('chat_id', TELEGRAM_CHAT_ID);
        form.append('photo', requestBody, {
            contentType: req.headers['content-type'].split(';')[0].trim(),
            filename: 'photo.jpeg' // نام فایل ارسالی به تلگرام
        });

        // ساخت URL API تلگرام برای ارسال عکس
        const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        
        // ارسال درخواست به تلگرام
        const telegramResponse = await fetch(TELEGRAM_URL, {
            method: 'POST',
            body: form
            // تلگرام نیاز به Content-Type multipart/form-data دارد که FormData آن را تنظیم می‌کند
        });
        
        const result = await telegramResponse.json();
        
        if (result.ok) {
            res.status(200).json({ ok: true, message: 'Photo sent successfully to Telegram.' });
        } else {
            // در صورت خطا در API تلگرام (مثلاً چت آیدی اشتباه)
            res.status(500).json({ ok: false, error: result.description || 'Telegram API Error' });
        }

    } catch (error) {
        console.error('Serverless Function Error:', error);
        res.status(500).json({ ok: false, error: 'Internal Server Error processing request.' });
    }
};