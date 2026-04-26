'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

const samples = {
  curl: `curl -X POST https://api.aspra.io/v1/public/recharge/quote \\
  -H "Authorization: Bearer $KAPI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "operatorId": "mtn-ng",
    "msisdn": "+2348012345678",
    "amount": 1000,
    "currency": "NGN"
  }'`,
  node: `import { Kapi } from "@aspra/kapi"

const kapi = new Kapi({ apiKey: process.env.KAPI_KEY })

const quote = await kapi.recharge.quote({
  operatorId: "mtn-ng",
  msisdn: "+2348012345678",
  amount: 1000,
  currency: "NGN",
})

console.log(quote.id, quote.fxRate)`,
  python: `from aspra_kapi import Kapi

kapi = Kapi(api_key=os.environ["KAPI_KEY"])

quote = kapi.recharge.quote(
    operator_id="mtn-ng",
    msisdn="+2348012345678",
    amount=1000,
    currency="NGN",
)

print(quote.id, quote.fx_rate)`,
}

type Lang = keyof typeof samples

export function CodeSample() {
  const [active, setActive] = React.useState<Lang>('curl')
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(samples[active])
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border bg-zinc-950 text-zinc-100 shadow-lg">
      <Tabs value={active} onValueChange={(v) => setActive(v as Lang)}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
          <TabsList className="bg-zinc-900 text-zinc-400">
            <TabsTrigger
              value="curl"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
            >
              curl
            </TabsTrigger>
            <TabsTrigger
              value="node"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
            >
              Node
            </TabsTrigger>
            <TabsTrigger
              value="python"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50"
            >
              Python
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={copy}
            className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        {(['curl', 'node', 'python'] as const).map((l) => (
          <TabsContent key={l} value={l} className="m-0">
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed">
              <code>{samples[l]}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
