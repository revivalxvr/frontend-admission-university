"use client";
import React from "react"

import { DonutChart, TooltipProps } from "@/src/app/components/card/DonatChart";

interface DataItem {
  name: string
  amount: number
}
const data: DataItem[] = [
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

export default function DonutChartHero() {
  const [datas, setDatas] = React.useState<TooltipProps | null>(null)

  const sumNumericArray = (arr: number[]): number =>
    arr.reduce((sum, num) => sum + num, 0)

  const currencyFormatter = (number: number) =>
    `$${Intl.NumberFormat("us").format(number)}`

  const payload = datas?.payload?.[0]
  const value = payload?.value ?? 0

  const formattedValue = payload
    ? currencyFormatter(value)
    : currencyFormatter(
        sumNumericArray(data.map((dataPoint) => dataPoint.amount)),
      )

  return (
    <div className="flex flex-col gap-12">
      <p className="text-center text-sm text-gray-700 dark:text-gray-300">
        Revenue by category
      </p>
      <p className="mt-2 w-full text-center text-xl font-semibold text-gray-900 dark:text-gray-50">
        {formattedValue}
      </p>
      <DonutChart
        data={data}
        category="name"
        value="amount"
        className="mx-auto mt-8"
        colors={["blue", "violet", "cyan", "emerald"]}
        tooltipCallback={(props) => {
          if (props.active) {
            setDatas((prev) => {
              if (prev?.payload[0].category === props.payload[0].category)
                return prev
              return props
            })
          } else {
            setDatas(null)
          }
          return null
        }}
      />
    </div>
  );
}
