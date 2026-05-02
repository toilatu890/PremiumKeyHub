const { createClient } = require('@supabase/supabase-js');

// Dùng chung thông tin Supabase với file pay.js của ông
const supabase = createClient(
    'https://jmxfglavbkcyhtdvsehn.supabase.co', 
    'sb_publishable_2Sc4xFF6x-UCXb_73NY-Jw_FgOE3S9y'
);

export default async function handler(req, res) {
    // Chỉ cho phép Roblox hoặc trình duyệt lấy dữ liệu qua phương thức GET
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');

    const { nick } = req.query;

    if (!nick) {
        return res.status(400).json({ success: false, msg: "Thiếu tên Nick sưng bro!" });
    }

    try {
        // Tìm trong Supabase xem Nick này có trong danh sách đã nạp thẻ chưa
        const { data, error } = await supabase
            .from('keys_store')
            .select('key_code')
            .eq('roblox_nick', nick)
            .single();

        if (error || !data) {
            // Nếu không tìm thấy hoặc lỗi, trả về là chưa có Key
            return res.status(404).json({ success: false, msg: "Nick này chưa mua bản quyền!" });
        }

        // Nếu tìm thấy, trả về Key để script trong game xác nhận
        return res.status(200).json({ success: true, key: data.key_code });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Lỗi hệ thống: " + err.message });
    }
}
