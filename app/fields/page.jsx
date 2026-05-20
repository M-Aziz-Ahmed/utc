import GetAllFields from "@/components/fields/GetAllFields";

const page = () => {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="">
                <div className="">
                    <label htmlFor="">Label</label>
                    <input type="text" />
                </div>
                <div className="">
                    <label htmlFor="">Type</label>
                    <select name="" id="">
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="[assword">password</option>
                    </select>
                </div>
            </div>
            <div className=""><GetAllFields/></div>
        </div>
    );
}

export default page;