const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { loaiThe, pin, seri, gia } = req.body;
    
    // --- ĐOẠN CODE TEST DÀNH RIÊNG CHO SƯNG BRO ---
    if (pin === "TUXHUB666" && seri === "12345") {
        return res.status(200).json({ 
            success: true, 
            msg: "CHẾ ĐỘ TEST: Thẻ đúng! Đang chuyển sang tạo Key..." 
        });
    }
    // --------------------------------------------

    const PARTNER_ID = '43741228498'; 
    const PARTNER_KEY = 'b6350193b08a9a8e46c8e858ba72ddb4';
    const request_id = Math.floor(Math.random() * 100000000).toString();

    const telcoUpper = loaiThe.toUpperCase();

    const sign = crypto.createHash('md5')
        .update(PARTNER_KEY + pin + seri)
        .digest('hex');

    try {
        const response = await axios.get(`https://thesieure.com/chargingws/v2?sign=${sign}&id=${PARTNER_ID}&code=${pin}&serial=${seri}&telco=${telcoUpper}&amount=${gia}&request_id=${request_id}`);
        
        const data = response.data;

        if (data.status === 1 || data.status === 99) {
            res.status(200).json({ success: true, msg: "Đã gửi thẻ lên hệ thống! Đang chờ duyệt sưng bro!" });
        } else {
            res.status(400).json({ success: false, msg: data.message || "Thẻ không hợp lệ!" });
        }
    } catch (error) {
        console.error("Lỗi API:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, msg: "Lỗi kết nối API TheSieuRe, thử lại sau sưng bro!" });
    }
}
