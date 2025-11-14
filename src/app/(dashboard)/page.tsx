import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <h1>Hello, world!</h1>
      <p>Welcome to the dashboard!</p>
      <div>
        <Link href="/dashboard/products">Products</Link>
      </div>
      <div>
        <Link href="/dashboard/orders">Accounts</Link>
      </div>
    </div>
  );
}