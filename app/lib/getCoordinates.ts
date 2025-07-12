/**
 * 주소를 위도/경도로 변환하는 클라이언트 유틸 함수
 * → 서버 API Route(`/api/geocode`)를 통해 Naver Geocoding API 요청을 프록시함
 */

export const getCoordinates = async (address) => {
    try {
        const response = await fetch(`/api/geocode?query=${encodeURIComponent(address)}`);
        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        const result = data.addresses?.[0];
        console.warn(`📍 주소에 대한 좌표: ${result.y} , ${result.x}`);
        if (result) {
            return {
                latitude: parseFloat(result.y), // 위도
                longitude: parseFloat(result.x) // 경도
            };
        } else {
            console.warn(`📍 주소에 대한 좌표를 찾을 수 없습니다: ${address}`);
            return null;
        }
    } catch (error) {
        console.error('🛑 좌표 변환 오류:', error.message);
        return null;
    }
};
