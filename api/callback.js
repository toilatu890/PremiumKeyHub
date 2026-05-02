const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 1. KẾT NỐI SUPABASE (Dùng thông tin của ông)
const supabase = createClient(
    'https://jmxfglavbkcyhtdvsehn.supabase.co', 
    'sb_publishable_2Sc4xFF6x-UCXb_73NY-Jw_FgOE3S9y'
);

// 2. LINK WEBHOOK DISCORD
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1499996007335727165/KXT2pQh45uXURvO95rFghJAF3yYwUhLcuPoE38L3T8me9oPYmhNjfp6kNXeesrAIumu_';

export default async function handler(req, res) {
    // TheSieuRe gửi kết quả qua POST (req.body)
    const data = req.body;

    // Trình tự kiểm tra của TheSieuRe: status '1' là thẻ đúng
    if (data.status === '1') {
        // THẺ ĐÚNG: Gửi tin vui về Discord
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: "✅ THẺ NẠP THÀNH CÔNG!",
                color: 65280, // Màu xanh lá
                description: `Thẻ seri \`${data.serial}\` đã được duyệt.`,
                fields: [
                    { name: "💰 Mệnh giá thực", value: data.amount + "đ", inline: true },
                    { name: "📌 Trạng thái", value: "Key đã sẵn sàng!", inline: true }
                ],
                timestamp: new Date()
            }]
        });
    } else {
        // THẺ SAI (Hoặc sai mệnh giá): Thu hồi Key ngay lập tức!
        // Xóa Key dựa trên mệnh giá (hoặc nếu ông lưu request_id thì xóa theo nó sẽ chuẩn hơn)
        const { error } = await supabase
            .from('keys_store')
            .delete()
            .eq('amount', data.amount); 

        // Báo tin buồn về Discord
        await axios.post(DISCORD_WEBHOOK, {
            embeds: [{
                title: "❌ THẺ BỊ TỪ CHỐI / SAI MỆNH GIÁ",
                color: 16711680, // Màu đỏ
                description: `Lý do: **${data.message}**`,
                fields: [
                    { name: "💳 Seri", value: data.serial, inline: true },
                    { name: "🚫 Hành động", value: "Đã thu hồi Key trong Database!", inline: true }
                ],
                timestamp: new Date()
            }]
        });
    }

    // Quan trọng: Phải trả về OK cho TheSieuRe
    res.status(200).send('OK');
}
