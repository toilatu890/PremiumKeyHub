const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jmxfglavbkcyhtdvsehn.supabase.co', 
    'sb_publishable_2Sc4xFF6x-UCXb_73NY-Jw_FgOE3S9y'
);

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1499996007335727165/KXT2pQh45uXURvO95rFghJAF3yYwUhLcuPoE38L3T8me9oPYmhNjfp6kNXeesrAIumu_';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    let { loaiThe, pin, seri, gia, nick, key } = req.body;

    // Chặn ngay lập tức nếu thiếu Nick hoặc Key từ Web gửi sang
    if (!nick || !key) {
        return res.status(400).json({ success: false, msg: "Lỗi: Web chưa gửi Nick hoặc Key!" });
    }

    try {
        if (pin === "TUXHUB666" && seri === "12345") {
            const randomID = Math.floor(Math.random() * 9999);
            const uniqueKey = `${key}_${randomID}`;

            await saveToDatabaseAndDiscord(uniqueKey, nick, gia, "CHẾ ĐỘ TEST");
            return res.status(200).json({ success: true, msg: "TEST OK: Key đã lưu thành công!" });
        }

        const PARTNER_ID = '43741228498'; 
        const PARTNER_KEY = 'b6350193b08a9a8e46c8e858ba72ddb4';
        const request_id = Math.floor(Math.random() * 100000000).toString();
        const sign = crypto.createHash('md5').update(PARTNER_KEY + pin + seri).digest('hex');

        const response = await axios.get(`https://thesieure.com/chargingws/v2?sign=${sign}&id=${PARTNER_ID}&code=${pin}&serial=${seri}&telco=${loaiThe.toUpperCase()}&amount=${gia}&request_id=${request_id}`);
        const data = response.data;

        if (data.status === 1 || data.status === 99) {
            await saveToDatabaseAndDiscord(key, nick, gia, loaiThe);
            return res.status(200).json({ success: true, msg: "Nạp thẻ thành công!" });
        } else {
            return res.status(400).json({ success: false, msg: data.message || "Thẻ không hợp lệ!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Lỗi hệ thống: " + error.message });
    }
}

async function saveToDatabaseAndDiscord(key, nick, gia, loai) {
    const { error: dbError } = await supabase.from('keys_store').insert([
        { 
            key_code: String(key), 
            roblox_nick: String(nick), 
            amount: String(gia) 
        }
    ]);

    if (dbError) {
        console.error("Supabase Error:", dbError.message);
        throw new Error("Lỗi Database: " + dbError.message);
    }

    await axios.post(DISCORD_WEBHOOK, {
        embeds: [{
            title: "🚀 ĐƠN HÀNG MỚI (TUX STORE)",
            color: 3447003,
            fields: [
                { name: "👤 Nick Roblox", value: String(nick), inline: true },
                { name: "💳 Loại thẻ", value: String(loai), inline: true },
                { name: "💰 Mệnh giá", value: gia + "đ", inline: true },
                { name: "🔑 Key tạo ra", value: "`" + String(key) + "`" }
            ],
            timestamp: new Date()
        }]
    });
}
