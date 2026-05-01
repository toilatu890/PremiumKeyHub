export default async function handler(req, res) {
    // TheSieuRe gửi kết quả qua POST
    const data = req.body;

    console.log("Dữ liệu TheSieuRe trả về:", data);

    // Kiểm tra trạng thái: status = 1 là thẻ đúng
    if (data.status === '1') {
        // Ở đây ông có thể viết thêm code để lưu vào Database hoặc gửi Telegram báo "Thẻ đúng"
        console.log(`Thẻ ${data.serial} đúng mệnh giá ${data.amount}`);
    } else {
        // Thẻ sai, sai mệnh giá, hoặc thẻ lỗi
        console.log(`Thẻ ${data.serial} bị lỗi: ${data.message}`);
    }

    // Luôn trả về 200 để báo cho TheSieuRe là web ông đã nhận được tin
    res.status(200).send('OK');
}
