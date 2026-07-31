import { NextResponse } from 'next/server';

const CFG = {
  tiktokUploadUrl: 'https://www.tiktok.com/api/upload/image/',
  tiktokCookie:
    'tt_chain_token=Dim/eb3irkAjKe+oM4mYhg==; delay_guest_mode_vid=8; _ttp=38AePetZPG2fzj1m0hRUq9R1Akq.tt.1; uid_tt=95389136426ebd64ef72e8437c8b0c87f7940969bd417e1739a0a7b20e1c20e6; uid_tt_ss=95389136426ebd64ef72e8437c8b0c87f7940969bd417e1739a0a7b20e1c20e6; sid_tt=fcd3ecfd8fead316feef021788438c5a; sessionid=fcd3ecfd8fead316feef021788438c5a; sessionid_ss=fcd3ecfd8fead316feef021788438c5a; store-idc=alisg; store-country-code=vn; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=eOZ1kIBRX31ArQDabFIo5Z7m5NpjTibVZSVl2kEU1vuHBM3BXg33rcaxIN4eH8Gg8CtuvJimKhcHIDwmUuomMjJ-2x9lPsPha5xs5odtNWNADu-4V2h-uiG36X8PyYDFteIJYUsbpZ1KQ8HlXj43_JoqfAAryx9ONgH5KBAbGJPtm6ulrAL2Ix99jtx6sYBnWdyh1l9gEZN-LqZPQAU9Pl0pEc055Ho4AF1zmdDdshJ14-GRiZN2rdUZ4pvCbFqbQBuhW0Olt8CWQYF-awEGgfKOBfqxpjZezmPZEoqIervJU4m7u0PUfUJHptUQMkIV07RGgvTns4Fa-X-Y-j37LgxcSw1GMsmGxwmjPQ7N0uwjczr5v7KQcwA0Zo8Z69DyA6WVnlFRjPACaV5k-Sph6l06WyFmuEP_3gVT-_Z1CXy3fm4o5x0MeUq6_U6wDquJ21__O61VJtqVJxZqBP_hc3Ir4YnDuhn0kwq1fDggcD_4tGIytMMc5OllSDX6A6Tc; last_login_method=google; sid_guard=fcd3ecfd8fead316feef021788438c5a%7C1770182340%7C15551999%7CMon%2C+03-Aug-2026+05%3A18%3A59+GMT; sid_ucp_v1=1.0.1-KGE0N2E3ODc4OGU1ZWM1MTQ5NThhM2YzNmYyMWY0ZDdmODkxNDQwYWQKIQiIiMmQ7IT5iWcQxK2LzAYYswsgDDCkyc-4BjgIQBJIBBADGgJteSIgZmNkM2VjZmQ4ZmVhZDMxNmZlZWYwMjE3ODg0MzhjNWEyTgog8TjpOWQeoIaAokwq59sq7APnd8l1wJ4buJZ1YF1Q-C0SIMwU5PJQ3Z2pU4aL5r5If-e50RKDEZ5FyCB2XMC4r8sSGAUiBnRpa3Rvaw; ssid_ucp_v1=1.0.1-KGE0N2E3ODc4OGU1ZWM1MTQ5NThhM2YzNmYyMWY0ZDdmODkxNDQwYWQKIQiIiMmQ7IT5iWcQxK2LzAYYswsgDDCkyc-4BjgIQBJIBBADGgJteSIgZmNkM2VjZmQ4ZmVhZDMxNmZlZWYwMjE3ODg0MzhjNWEyTgog8TjpOWQeoIaAokwq59sq7APnd8l1wJ4buJZ1YF1Q-C0SIMwU5PJQ3Z2pU4aL5r5If-e50RKDEZ5FyCB2XMC4r8sSGAUiBnRpa3Rvaw; tiktok_webapp_theme=dark; living_user_id=933329728858; tiktok_webapp_theme_source=auto; ttwid=1%7C3ft-1c43kWXYHYgZy14KDXQKwe9bQv9L9WbqKpQtybE%7C1774735520%7Cc19332b9834659d752363f46f6aaf8fd67674e21a794e9ddb00566f66b8909cd; tt_session_tlb_tag=sttt%7C4%7C_NPs_Y_q0xb-7wIXiEOMWv________-vkvVJ90ehaGxP9VFPpUvlRRu5ooyXYF8mG37Le7jTaBk%3D; passport_csrf_token=fb89332c824e2760a3954a5ef32fba37; passport_csrf_token_default=fb89332c824e2760a3954a5ef32fba37; tt_csrf_token=KgW0PAle-gWM4mmxrIFj6CD_EGASSVA8Ekwg; msToken=bpz7yAXUXs8nIAVCA-mqBK9xvva9YbIN3xwkB0QV6pslt_6BO4TjxdwJS2kHXIQvoSblNZCuWB6eISOv4NNYLW0jn4z6V_pEovUMgPEDRcTm0oJQsjv-s0lV9Q0YnZ6rxmPJZeWu_EuBB6g=; passport_fe_beating_status=true; ttwid=1%7C3ft-1c43kWXYHYgZy14KDXQKwe9bQv9L9WbqKpQtybE%7C1774735520%7Cc19332b9834659d752363f46f6aaf8fd67674e21a794e9ddb00566f66b8909cd; odin_tt=0b342e4537f45d370217206896fe465006592476e8634ee4a4fb5905f269b1d254e4755df0584456e267f8368c4fa6f6bf345f164734bf24ff888ebac24ca39e150090a411a2a4091d7106b1e3d45771; store-country-sign=MEIEDBxQKT-2jTNGlLnTgAQg0EGpNsv90YXDlAZsgpdeswmE1rR21xS94RJJsk_CFzwEEBvjI4_ftxzEQvVV_xsivRU; s_v_web_id=verify_mnauxq9b_cl9S8Cgv_xuIs_4w0u_Bfyi_qxXOILi8M8yy; msToken=bpz7yAXUXs8nIAVCA-mqBK9xvva9YbIN3xwkB0QV6pslt_6BO4TjxdwJS2kHXIQvoSblNZCuWB6eISOv4NNYLW0jn4z6V_pEovUMgPEDRcTm0oJQsjv-s0lV9Q0YnZ6rxmPJZeWu_EuBB6g=',
  tiktokCsrfToken: 'KgW0PAle-gWM4mmxrIFj6CD_EGASSVA8Ekwg',
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không nhận được file gửi lên.' },
        { status: 400 },
      );
    }

    // Đóng gói payload gửi sang TikTok
    const tiktokFormData = new FormData();
    tiktokFormData.append('file', file, file.name);
    tiktokFormData.append('source', '0');

    // Nạp toàn bộ header mạo danh trình duyệt giống code PHP của sếp
    const headers = {
      accept: '*/*',
      'accept-language': 'vi,en;q=0.9,en-US;q=0.8',
      'cache-control': 'no-cache', // <--- SỬA Ở ĐÂY: Bỏ dấu : đi
      origin: 'https://www.tiktok.com',
      pragma: 'no-cache',
      referer: 'https://www.tiktok.com/@alongchoigame',
      'sec-ch-ua':
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'tt-csrf-token': CFG.tiktokCsrfToken,
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      Cookie: CFG.tiktokCookie,
    };

    const response = await fetch(CFG.tiktokUploadUrl, {
      method: 'POST',
      headers: headers,
      body: tiktokFormData,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `TikTok WAF từ chối: Status ${response.status}`,
        },
        { status: 500 },
      );
    }

    const resJson = await response.json();
    const code = resJson?.code ?? resJson?.status_code;

    if (code === 0) {
      const dataBlock = resJson?.data || {};
      let finalUrl = null;

      // Ưu tiên 1: uri gốc
      if (dataBlock.uri) {
        finalUrl = `https://p16-webcast.tiktokcdn.com/obj/${dataBlock.uri}`;
      } else {
        // Fallback bốc nối chuỗi
        let webUri = dataBlock.original_img_uri || null;
        if (!webUri && dataBlock.image_info) {
          const info = dataBlock.image_info;
          webUri = Array.isArray(info)
            ? info[0]?.web_uri || null
            : info?.web_uri || null;
        }
        if (!webUri) {
          webUri =
            dataBlock.url || dataBlock.image_url || dataBlock.web_uri || null;
        }

        if (webUri) {
          finalUrl = webUri.startsWith('http')
            ? webUri
            : `https://p16-tiktok-ads-sg.tiktokcdn.com/obj/${webUri}`;
        }
      }

      if (finalUrl) {
        return NextResponse.json({
          success: true,
          fileName: file.name,
          tsFileName: file.name.replace('.png', '.ts'),
          url: finalUrl,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Đâm thủng nhưng cấu trúc JSON trả về thiếu URL CDN.',
          debug: dataBlock,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          resJson?.msg ||
          resJson?.message ||
          'API TikTok báo lỗi không xác định.',
      },
      { status: 400 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Lỗi hệ thống: ${error.message}` },
      { status: 500 },
    );
  }
}
