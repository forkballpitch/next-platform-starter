'use client'; // 클라이언트 컴포넌트임을 명시합니다.

import Image from 'next/image';
import Link from 'next/link';
import netlifyLogo from 'public/netlify-logo.svg';
import { useState } from 'react';

const navItems = [
    { linkText: '홈', href: '/' },
    {
        linkText: '학군지 정보',
        href: '#',
        subMenu: [
            { linkText: '학교 정보', href: '/school-info' },
            { linkText: '학군 지도', href: '/school-map' },
            { linkText: '학군 랭킹', href: '/school-rankings' }
        ]
    },
    { linkText: '부동산 매물', href: '/real-estate' },
    { linkText: '부동산 분석', href: '/revalidation' },
    { linkText: '리얼타임 데이터', href: '/real-time-data' },
    { linkText: '커뮤니티', href: '/community' },
    { linkText: '블로그 및 뉴스', href: '/blog-news' },
    { linkText: '고객 서비스', href: '/customer-service' },
    { linkText: '부동산 투자', href: '/real-estate-investment' }
];

export function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(null);

    // 드롭다운 토글 함수
    const toggleDropdown = (index) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

    return (
        <nav className="flex flex-wrap items-center gap-4 pt-6 pb-12 sm:pt-12 md:pb-24">
            <Link href="/">
                <Image src={netlifyLogo} alt="Netlify logo" />
            </Link>
            {!!navItems?.length && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {navItems.map((item, index) => (
                        <li key={index} className="relative">
                            <Link
                                href={item.href}
                                className="inline-block px-1.5 py-1 transition hover:opacity-80 sm:px-3 sm:py-2"
                                onClick={item.subMenu ? (e) => {
                                    e.preventDefault();
                                    toggleDropdown(index);
                                } : undefined}
                            >
                                {item.linkText}
                            </Link>
                            {/* 드롭다운 메뉴 */}
                            {item.subMenu && dropdownOpen === index && (
                                <ul className="absolute left-0 mt-2 bg-white shadow-lg rounded-lg w-48">
                                    {item.subMenu.map((subItem, subIndex) => (
                                        <li key={subIndex}>
                                            <Link
                                                href={subItem.href}
                                                className="block px-4 py-2 text-gray-700 hover:bg-gray-200"
                                            >
                                                {subItem.linkText}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}

        </nav>
    );
}
