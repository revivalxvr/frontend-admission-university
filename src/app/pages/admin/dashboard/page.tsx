"use client";
import React, { useEffect, useState } from "react";
import { DonutChart, DonutChartEventProps } from "@/src/app/components/card/DonatChart";

// 
const chartdata = [
  {
    name: "SolarCells",
    amount: 4890,
  },
  {
    name: "Glass",
    amount: 2103,
  },
  {
    name: "JunctionBox",
    amount: 2050,
  },
  {
    name: "Adhesive",
    amount: 1300,
  },
  {
    name: "BackSheet",
    amount: 1100,
  },
  {
    name: "Frame",
    amount: 700,
  },
  {
    name: "Encapsulant",
    amount: 200,
  },
];


const DashboardPage = () => {
  const [value, setValue] = React.useState<DonutChartEventProps>(null)
  return (
    <section className="section">
      <div className="section-header">
        <h1>Dashboard</h1>
      </div>
    <DonutChart
        className="mx-auto" 
        data={chartdata}
        category="name"
        value="amount"
        onValueChange={(v) => setValue(v)}
      />
      <pre className="mt-8 rounded-md bg-gray-950 p-3 text-sm text-white dark:bg-gray-800">
        {JSON.stringify(value, null, 2)}
      </pre>
      
    </section>
  );
};

export default DashboardPage;

// interface Dashboard {
// //   totalStudents: number;
// //   totalFaculties: number;
// //   totalMajors: number;
// //   totalClasses: number;
// //   studyPlan: {
// //     approved: number;
// //     rejected: number;
// //     onprocess: number;
// //   };
// //   studentPerFaculty: [
// //     {
// //       facultyId: string;
// //       facultyName: string;
// //       studentCount: number;
// //     },
// //   ];
// //   payments: {
// //     paidCount: number;
// //     paidSum: number;
// //     unpaidCount: number;
// //     unpaidSum: number;
// //   };
// //   studyPlans: [
// //     {
// //       courseName: string;
// //       studentName: string;
// //       lectureName: string;
// //       status: string;
// //     },
// //   ];
// //   UpcomingTimeline: [
// //     {
// //       id: string;
// //       name: string;
// //       date: string;
// //       createdAt: string;
// //       updatedAt: string;
// //     },
// //   ];
// // }
// }