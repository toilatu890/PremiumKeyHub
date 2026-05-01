const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { loaiThe, pin, seri, gia, nick } = req.body;
    
    // THÔNG TIN TỪ ẢNH ÔNG GỬI
    const PARTNER_ID = '43741228498'; 
    const PARTNER_KEY = 'b6350193b08a9a8e46c8e858ba72ddb4';
    
    // Tạo mã đơn hàng ngẫu nhiên (Request ID)
    const request_id = Math.floor(Math.random() * 100000000).toString();

    // Công thức tạo chữ ký MD5 của TheSieuRe: md5(partner_key + pin + serial)
    const sign = crypto.createHash('md5')
        .update(PARTNER_KEY + pin + seri)
        .digest('hex');

    try {
        // Gửi yêu cầu gạch thẻ sang API V2 của TheSieuRe
        const response = await axios.get(`https://thesieure.com/chargingws/v2?sign=${sign}&id=${PARTNER_ID}&code=${pin}&serial=${seri}&telco=${loaiThe}&amount=${gia}&request_id=${request_id}`);
        
        const data = response.data;

        // Trạng thái 1 hoặc 99 là đã gửi thẻ thành công và đang chờ xử lý
        if (data.status === 1 || data.status === 99) {
            res.status(200).json({ success: true, msg: "Gửi thẻ thành công! Đang chờ duyệt..." });
        } else {
            res.status(400).json({ success: false, msg: data.message || "Thẻ không hợp lệ sưng bro!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, msg: "Lỗi kết nối API TheSieuRe!" });
    }
}
