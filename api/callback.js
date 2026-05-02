const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
    'https://jmxfglavbkcyhtdvsehn.supabase.co', 
    'sb_publishable_2Sc4xFF6x-UCXb_73NY-Jw_FgOE3S9y'
);

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1499996007335727165/KXT2pQh45uXURvO95rFghJAF3yYwUhLcuPoE38L3T8me9oPYmhNjfp6kNXeesrAIumu_';

export default async function handler(req, res) {
    const data = req.body;

    try {
        if (data.status === '1') {
            await axios.post(DISCORD_WEBHOOK, {
                embeds: [{
                    title: "✅ THẺ NẠP THÀNH CÔNG!",
                    color: 65280,
                    description: `Thẻ seri \`${data.serial}\` đã được duyệt.`,
                    fields: [
                        { name: "💰 Mệnh giá thực", value: data.amount + "đ", inline: true },
                        { name: "📌 Trạng thái", value: "Key đã sẵn sàng!", inline: true }
                    ],
                    timestamp: new Date()
                }]
            });
        } else {
            await supabase
                .from('keys_store')
                .delete()
                .eq('amount', data.amount); 

            await axios.post(DISCORD_WEBHOOK, {
                embeds: [{
                    title: "❌ THẺ BỊ TỪ CHỐI / SAI MỆNH GIÁ",
                    color: 16711680,
                    description: `Lý do: **${data.message}**`,
                    fields: [
                        { name: "💳 Seri", value: data.serial, inline: true },
                        { name: "🚫 Hành động", value: "Đã thu hồi Key trong Database!", inline: true }
                    ],
                    timestamp: new Date()
                }]
            });
        }
    } catch (error) {
        console.error(error);
    }

    res.status(200).send('OK');
}
