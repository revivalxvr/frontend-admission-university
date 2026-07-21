"use client";
import React, { useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface PaymentData {
  payments: {
    paidCount: number;
    paidSum: number;
    unpaidCount: number;
    unpaidSum: number;
  };
}

const PaymentCard: React.FC<PaymentData> = ({ payments }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  // Pastikan fallback aman jika properti undefined saat loading
  const paidCount = payments?.paidCount ?? 0;
  const unpaidCount = payments?.unpaidCount ?? 0;
  const paidSum = payments?.paidSum ?? 0;
  const unpaidSum = payments?.unpaidSum ?? 0;

  const totalCount = paidCount + unpaidCount;
  const paidPercent =
    totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  interface PieSeriesWithCenter extends Highcharts.Series {
    center: [number, number, number, number];
  }

  interface ChartWithCustom extends Highcharts.Chart {
    customLabel?: Highcharts.SVGElement;
    customMenu?: Highcharts.SVGElement;
  }

  const options: Highcharts.Options = {
    chart: {
      type: "pie",
      
      // @ts-expect-error - Highcharts custom property
      custom: {},
      events: {
        render(this: ChartWithCustom) {
          const series = this.series[0] as PieSeriesWithCenter;

          // 🚀 PERBAIKAN: Selalu hancurkan label lama agar teks persen di tengah ter-update mengikuti data terbaru
          if (this.customLabel) {
            this.customLabel.destroy();
          }

          this.customLabel = this.renderer
            .label(`Paid<br/><strong>${paidPercent}%</strong>`, 0, 0)
            .css({
              color: "#000",
              textAnchor: "middle",
            })
            .add();

          const height = Number(this.customLabel!.attr("height")) || 0;
          const x = series.center[0] + this.plotLeft;
          const y = series.center[1] + this.plotTop - height / 2;

          this.customLabel.attr({ x, y });
          this.customLabel.css({
            fontSize: `${series.center[2] / 12}px`,
          });

          if (!this.customMenu) {
            this.customMenu = this.renderer
              .text("...", this.chartWidth - 20, 20)
              .css({
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "bold",
              })
              .add()
              .on("click", () => {
                window.location.href = "/pages/admin/pembayaran";
              });
          }
        },
      },
    },
    title: {
      text: "Rekap Pembayaran",
      align: "left",
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y}</b> mahasiswa",
    },
    plotOptions: {
      pie: {
        innerSize: "70%",
        dataLabels: [
          {
            enabled: true,
            distance: 20,
            format: "{point.name}",
          },
          {
            enabled: totalCount > 0, // Hanya munculkan persentase jika ada data
            distance: -15,
            format: "{point.percentage:.0f}%",
            style: {
              fontSize: "0.9em",
            },
          },
        ],
      },
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: "pie",
        name: "Jumlah",
        colorByPoint: true,
        data: [
          { name: "Paid", y: paidCount, color: "#63ed7a" },
          { name: "Unpaid", y: unpaidCount, color: "#fc544b" },
        ],
      } as Highcharts.SeriesPieOptions,
    ],
  };

  return (
    <div
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      style={{ width: "374px", height: "500px" }}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartComponentRef}
        allowChartUpdate={true} //Mengizinkan grafik update otomatis saat data API masuk!
      />

      {/* Indikator bawah */}
      <div className="d-flex justify-content-around mt-2">
        <div className="d-flex flex-column align-items-center">
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#63ed7a",
            }}
          ></span>
          <small className="text-muted">Sudah dibayar</small>
          <strong>Rp {paidSum.toLocaleString("id-ID")}</strong>
        </div>
        <div className="d-flex flex-column align-items-center">
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#fc544b",
            }}
          ></span>
          <small className="text-muted">Belum dibayar</small>
          <strong>Rp {unpaidSum.toLocaleString("id-ID")}</strong>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;