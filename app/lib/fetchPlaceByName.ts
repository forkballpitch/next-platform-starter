export async function fetchPlaceByName(query: string) {
    const res = await fetch(`/api/placeSearch?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('장소 검색 실패');
    const data = await res.json();
    return data; // 🔄 전체 결과 리스트 반환
}
