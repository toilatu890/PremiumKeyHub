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

    const { loaiThe, pin, seri, gia, nick, key } = req.body;

    try {
        if (pin === "TUXHUB666" && seri === "12345") {
            await saveToDatabaseAndDiscord(key, nick, gia, "CHẾ ĐỘ TEST");
            return res.status(200).json({ success: true, msg: "TEST THÀNH CÔNG: Đã lưu Database và bắn Discord!" });
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
            let errorMsg = data.message === "INPUT_DATA_INCORRECT" ? "Mã thẻ/Seri sai định dạng!" : data.message;
            return res.status(400).json({ success: false, msg: errorMsg || "Thẻ không hợp lệ!" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message || "Lỗi hệ thống!" });
    }
}

async function saveToDatabaseAndDiscord(key, nick, gia, loai) {
    const { error: dbError } = await supabase.from('keys_store').insert([
        { key_code: key, roblox_nick: nick, amount: gia.toString() }
    ]);

    if (dbError) throw new Error(dbError.message);

    await axios.post(DISCORD_WEBHOOK, {
        embeds: [{
            title: "🚀 CÓ ĐƠN HÀNG MỚI (TUX STORE)",
            color: 3447003,
            fields: [
                { name: "👤 Người mua", value: nick, inline: true },
                { name: "💳 Loại thẻ", value: loai, inline: true },
                { name: "💰 Mệnh giá", value: gia + "đ", inline: true },
                { name: "🔑 Key tạo ra", value: "`" + key + "`" }
            ],
            timestamp: new Date()
        }]
    });
}
