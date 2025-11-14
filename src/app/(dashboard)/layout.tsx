'use client'
import Menu from '@/components/layouts/nav/menu'
import MenuLateral from '@/components/layouts/nav/menu-lateral'
import { ClickToComponent } from 'click-to-react-component'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Menu />
            {/* <MenuLateral /> */}
            {children}
        </div>
    )
}