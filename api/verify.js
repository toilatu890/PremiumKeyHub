const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://jmxfglavbkcyhtdvsehn.supabase.co', 
    'sb_publishable_2Sc4xFF6x-UCXb_73NY-Jw_FgOE3S9y'
);

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');

    const { nick } = req.query;

    if (!nick) {
        return res.status(400).json({ success: false, msg: "Thiếu tên Nick sưng bro!" });
    }

    try {
        // Lấy cả key_code và expiry_date để kiểm tra
        const { data, error } = await supabase
            .from('keys_store')
            .select('key_code, expiry_date')
            .eq('roblox_nick', nick)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, msg: "Nick này chưa mua bản quyền!" });
        }

        // Logic kiểm tra thời gian hết hạn
        const now = new Date();
        const expiry = new Date(data.expiry_date);

        if (now > expiry) {
            // Nếu thời gian hiện tại lớn hơn thời gian hết hạn thì chặn luôn
            return res.status(403).json({ 
                success: false, 
                msg: "Key của ông đã hết hạn vào lúc " + expiry.toLocaleString('vi-VN') 
            });
        }

        // Nếu còn hạn thì mới trả về key_code cho script chạy
        return res.status(200).json({ 
            success: true, 
            key: data.key_code,
            expires_at: data.expiry_date 
        });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Lỗi hệ thống: " + err.message });
    }
}
