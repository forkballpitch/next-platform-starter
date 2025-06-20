/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/llm', // ✅ 프론트엔드에서 이 경로로 요청하면
                destination: 'https://vtqjvgchmwcjwsrela2oyhlegu0hwqnw.lambda-url.us-west-2.on.aws/' // ✅ 이곳으로 프록시됨
            },
            {
                source: '/api/rss',
                destination: 'https://judynewyork.tistory.com/rss'
            }
        ];
    },
    reactStrictMode: false /** 운영은 true로 배포 */,
    swcMinify: true
};

module.exports = nextConfig;
