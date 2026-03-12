import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Internal Report",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function HiddenChartPage() {
  return (
    <div className="min-h-screen w-full p-4">
      {/* Paste your Sankey chart HTML below this comment */}

      <div
        dangerouslySetInnerHTML={{
          __html: `
        <!-- PASTE YOUR SANKEY CHART HTML HERE -->
        
      `,
        }}
      />

      {/* Or you can paste it directly as JSX if it's React-compatible */}
    </div>
  )
}
