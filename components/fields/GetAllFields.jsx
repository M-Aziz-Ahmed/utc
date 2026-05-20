'use client'
import DynamicFeilds from "@/models/DynamicFeilds";
import { useEffect } from "react";

const GetAllFields = async () => {
    const fetchField = async ()=>{
        const fields = await DynamicFeilds.find()
    }
    useEffect(()=>{
        fields()
    },[fields])
    return (
        <div>
            {fields.label}
        </div>
    );
}

export default GetAllFields;