export async function POST(req: Request) {
    // let data = await req.json()
    // console.log(data)

    return Response.json({
        chainId: "eip155:84532", // Base 0xaa36a7
        method: "eth_sendTransaction",
        params: {
            abi: null,
            to: "0xA1357118529B120842a65C7EE7f0Dc91bad49439",
            value: "300000000000"
        }
    })
}