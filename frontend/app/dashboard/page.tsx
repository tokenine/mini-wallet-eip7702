"use client"

import { title } from "@/components/primitives";
import MyCard from "@/components/Card";
import MyTable from "@/components/Table";
import MyTab from "@/components/Tab";

export default function Dashboard() {
    return (
        <div>
            <h1 className={title()}>Dashboard</h1>

            <br /><br />

            <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex flex-col space-y-2 flex-1">
                    <MyCard />
                    <MyTable />
                </div>

                <div className="w-full md:w-[400px]">
                    <MyTab />
                </div>
            </div>

        </div>
    );
}
