const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const { loaiThe, pin, seri, gia } = req.body;
    
    // --- ĐOẠN CODE TEST DÀNH RIÊNG CHO SƯNG BRO ---
    // Nhập Mã: TUXHUB666 | Seri: 12345 để xem giao diện trả Key
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

    // Đảm bảo nhà mạng viết HOA hoàn toàn
    const telcoUpper = loaiThe.toUpperCase();

    // Tạo chữ ký MD5
    const sign = crypto.createHash('md5')
        .update(PARTNER_KEY + pin + seri)
        .digest('hex');

    try {
        const response = await axios.get(`https://thesieure.com/chargingws/v2?sign=${sign}&id=${PARTNER_ID}&code=${pin}&serial=${seri}&telco=${telcoUpper}&amount=${gia}&request_id=${request_id}`);
        
        const data = response.data;

        // Nếu status là 1 hoặc 99 là thành công gửi thẻ lên hệ thống
        if (data.status === 1 || data.status === 99) {
            res.status(200).json({ success: true, msg: "Đã gửi thẻ lên hệ thống! Đang chờ duyệt sưng bro!" });
        } else {
            // DỊCH LỖI SANG TIẾNG VIỆT CHO KHÁCH DỄ HIỂU
            let errorMsg = data.message;
            
            if (errorMsg === "INPUT_DATA_INCORRECT") {
                errorMsg = "Sai định dạng thẻ hoặc Seri sưng bro!";
            } else if (errorMsg === "INVALID_CARD" || errorMsg === "CARD_NOT_FOUND") {
                errorMsg = "Thẻ không tồn tại hoặc đã nạp rồi!";
            } else if (errorMsg === "WRONG_AMOUNT") {
                errorMsg = "Chọn sai mệnh giá thẻ rồi sưng bro!";
            }

            res.status(400).json({ success: false, msg: errorMsg || "Thẻ không hợp lệ!" });
        }
    } catch (error) {
        console.error("Lỗi API:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, msg: "Lỗi kết nối máy chủ TheSieuRe sưng bro!" });
    }
}
