import DynamicFeilds from "@/models/DynamicFeilds";
import dbConnect from "@/utils/dbConnection";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await dbConnect();
    const fields = await DynamicFeilds.find({});
    return NextResponse.json(fields, { status: 200 });
  } catch (error) {
    console.error('getFields error:', error);
    return NextResponse.json({ message: 'error fetching fields' }, { status: 500 });
  }
};
export const POST = async (req) => {
  const { belongsto } = await req.json()
  try {
    await dbConnect();
    const fields = await DynamicFeilds.find({ belongsto });
    return NextResponse.json(fields, { status: 200 });
  } catch (error) {
    console.error('getFields error:', error);
    return NextResponse.json({ message: 'error fetching fields' }, { status: 500 });
  }
};
