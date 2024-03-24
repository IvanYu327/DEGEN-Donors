import { initializeApp } from "firebase/app";
import { get, getDatabase, ref } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeiitajd2hd8VK1O_LQbxnC9ivFrNEAjs",
    authDomain: "defi-donors.firebaseapp.com",
    projectId: "defi-donors",
    storageBucket: "defi-donors.appspot.com",
    messagingSenderId: "993271436077",
    appId: "1:993271436077:web:8e5dad32ec7f87638779a4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase();


export async function POST(req: Request, params: any) {
    let query = new URLSearchParams(req.url.split('?')[1]);
    let data = await req.json()

    let amountStr = query.get("amount")
    if (amountStr == "custom") amountStr = data.untrustedData.inputText
    if (!amountStr) return Response.json({})

    let amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return Response.json({})

    amount *= (1 / 3379.25) * 1e18

    const id = req.url.split('/transactions/target')[0]?.split('/').pop()
    const dbRef = ref(database, id);
    const snapshot = await get(dbRef);
    if (!snapshot.exists()) {
        throw new Error("No data available");
    }

    const { chainId, address } = snapshot.val();

    return Response.json({
        chainId: `eip155:${chainId}`, // Base 0xaa36a7
        method: "eth_sendTransaction",
        params: {
            abi: null,
            to: address,
            value: Math.floor(amount).toString()
        }
    })
}