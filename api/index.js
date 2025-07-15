    1     import { OpenAI } from 'openai';
    2
    3     export const config = {
    4         runtime: 'edge',
    5     };
    6
    7     export default async function handler(request) {
    8         if (request.method !== 'POST') {
    9             return new Response(JSON.stringify({ error: 'Method not allowed' }), { status:
      405 });
   10         }
   11
   12         try {
   13             const { bust, waist, hips, height } = await request.json();
   14
   15             if (!bust || !waist || !hips || !height) {
   16                 return new Response(JSON.stringify({ error: 'Missing measurement parameters'
      }), { status: 400 });
   17             }
   18
   19             const openai = new OpenAI({
   20                 apiKey: process.env.OPENAI_API_KEY,
   21             });
   22
   23             // 1. Get style recommendation
   24             const style_prompt = `A person has the following body measurements: bust ${bust}
      inches, waist ${waist} inches, hips ${hips} inches, and height ${height} cm. Based on these
      measurements, what is the single most flattering wedding dress style for them? Choose from
      styles like A-Line, Ball Gown, Mermaid, Sheath, Empire, or Princess. Return ONLY the name of
      the style, for example: 'A-Line'.`;
   25
   26             const styleResponse = await openai.chat.completions.create({
   27                 model: 'gpt-4o-mini',
   28                 messages: [{ role: 'user', content: style_prompt }],
   29                 max_tokens: 20,
   30             });
   31
   32             const recommended_style = styleResponse.choices[0].message.content.trim();
   33
   34             // 2. Generate images with DALL-E
   35             const image_prompt = `A photorealistic, elegant wedding dress in the '
      ${recommended_style}' style. The dress is on a mannequin against a plain, light-colored
      studio background. Full view shot.`;
   36
   37             const imageResponse = await openai.images.generate({
   38                 model: 'dall-e-3',
   39                 prompt: image_prompt,
   40                 n: 3,
   41                 size: '1024x1024',
   42             });
   43
   44             const imageUrls = imageResponse.data.map(img => img.url);
   45
   46             // 3. Return the successful response
   47             return new Response(JSON.stringify({
   48                 style: recommended_style,
   49                 images: imageUrls,
   50             }), {
   51                 status: 200,
   52                 headers: { 'Content-Type': 'application/json' },
   53             });
   54
   55         } catch (error) {
   56             console.error(error);
   57             return new Response(JSON.stringify({ error: error.message }), { status: 500 });
   58         }
   59     }

   5. Now, go back to the main vercel-dress-app folder.
   6. Create a new text file named package.json.
   7. Open package.json and paste the following code into it:


   1     {
   2         "dependencies": {
   3             "openai": "^4.20.0"
   4         }
   5     }