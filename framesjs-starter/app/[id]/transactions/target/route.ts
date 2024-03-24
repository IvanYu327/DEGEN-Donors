export async function POST(req: Request, params: any) {
    let query = new URLSearchParams(req.url.split('?')[1]);
    let data = await req.json()
    // console.log(query)
    // console.log(data)
    console.log(params)

    let amountStr = query.get("amount")
    if (amountStr == "custom") amountStr = data.untrustedData.inputText
    if (!amountStr) return Response.json({})

    let amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return Response.json({})

    amount *= (1 / 3379.25) * 1e18

    return Response.json({
        chainId: "eip155:84532", // Base 0xaa36a7
        method: "eth_sendTransaction",
        params: {
            abi: null,
            to: "0xA1357118529B120842a65C7EE7f0Dc91bad49439",
            value: Math.floor(amount).toString()
        }
    })
}