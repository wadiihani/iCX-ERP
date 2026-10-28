import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';

  const response = NextResponse.redirect(url);
  response.cookies.delete('aiesec_dev_session');
  return response;
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('aiesec_dev_session');
  return response;
}
