import Link from "next/link";

export default function Logo () {
    return (
        <h1 className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            <Link href="/">Seenaa</Link>
        </h1>
    )
}
