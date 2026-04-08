import Anthropic from "@anthropic-ai/sdk";
import { today, last7Days, workouts } from "@/lib/mockData";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildHealthContext() {
  const s = today.sleep;
  const recentHRV = last7Days.map((d) => d.hrv).join(", ");
  const recentRecovery = last7Days.map((d) => d.recovery).join(", ");
  const recentSleep = last7Days.map((d) => d.sleep.duration).join(", ");

  return `
คุณคือ BearHealth AI Coach — โค้ชสุขภาพส่วนตัวที่ฉลาดและใส่ใจ
พูดภาษาไทยได้ (และอังกฤษถ้าผู้ใช้ถามภาษาอังกฤษ)
ตอบกระชับ เข้าใจง่าย ใช้ข้อมูลสุขภาพจริงของผู้ใช้ในการวิเคราะห์

== ข้อมูลสุขภาพของผู้ใช้วันนี้ ==
วันที่: ${today.date}

• Recovery Score: ${today.recovery}/100 (${today.recovery >= 67 ? "ดีเยี่ยม" : today.recovery >= 34 ? "ปานกลาง" : "ต่ำ"})
• Strain Score: ${today.strain}/21
• HRV (Heart Rate Variability): ${today.hrv} ms
• ชีพจรขณะพัก (Resting HR): ${today.restingHR} bpm
• SpO2: ${today.spo2}%
• อัตราการหายใจ: ${today.respiratoryRate} ครั้ง/นาที
• ก้าวเดิน: ${today.steps.toLocaleString()} ก้าว
• แคลอรี่เผาผลาญ: ${today.calories.toLocaleString()} kcal

== การนอนหลับเมื่อคืน ==
• คะแนนการนอน: ${s.score}/100
• ระยะเวลา: ${s.duration} ชั่วโมง
• ประสิทธิภาพ: ${s.efficiency}%
• REM: ${s.rem} ชม. | หลับลึก: ${s.deep} ชม. | หลับตื้น: ${s.light} ชม. | ตื่นกลางดึก: ${s.awake} ชม.
• เวลาก่อนหลับ: ${s.latency} นาที
• ตื่นกลางดึก: ${s.disturbances} ครั้ง

== แนวโน้ม 7 วัน ==
• HRV (ms): ${recentHRV}
• Recovery (%): ${recentRecovery}
• ระยะเวลานอน (ชม.): ${recentSleep}

== การออกกำลังกายล่าสุด ==
${workouts
  .slice(0, 3)
  .map(
    (w) =>
      `• ${w.name}: ${w.duration} นาที, avg HR ${w.avgHR} bpm, strain ${w.strain.toFixed(1)}, ${w.calories} kcal`
  )
  .join("\n")}

== คำแนะนำในการตอบ ==
- ใช้ข้อมูลจริงข้างต้นในการวิเคราะห์ อย่าตอบแบบทั่วไป
- ถ้าถามเรื่อง recovery ให้วิเคราะห์จาก HRV, ชีพจรพัก, การนอน
- ถ้าถามเรื่องการออกกำลังกาย ให้แนะนำตาม strain และ recovery ของวันนี้
- ถ้า recovery ต่ำ ให้แนะนำให้พัก อย่าแนะนำออกกำลังกายหนัก
- ตอบสั้น กระชับ ได้ใจความ ไม่เกิน 3-4 ย่อหน้า
- ใช้ emoji ได้บ้างเพื่อให้อ่านง่าย
`.trim();
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: buildHealthContext(),
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Chat failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
