"use client";

import InventoryTableHeader from "@/components/InventoryTableHeader";
import ValidationInput from "@/components/ValidationInput";
import ValidationSelect from "@/components/ValidationSelect";
import { useGetExistedItems } from "@/hooks/ExistedItems/useGetExistedItems";
import { ExistedFormData, ExistedSchema } from "@/schemas/ExistedFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa";
import * as XLSX from "xlsx";

interface ExistingItems {
  name: string;
  imagePath: string;
  brand: string;
  serial: string;
  notes: string;
  quantity: number;
  quantityEnum: string;
  sqId: number;
  sq: string | null;
  createdByUserId: string;
  createdUser: string | null;
  createdDate: string;
  lastModifiedUserId: string | null;
  lastModifiedUser: string | null;
  lastModifiedDate: string;
  isDeleted: boolean;
  id: number;
}
export default function InventoryPage() {
  const { data: existedData } = useGetExistedItems();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await axios.post("http://172.16.7.61:9991/api/ExistingItems", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ` + localStorage.getItem("accessToken"),
          },
        });
        return response.data;
      } catch (error) {
        toast.error("فشل إضافة العنصر");
        throw error;
      }
    },

    onSuccess: data => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["ExistedItems"] });
      toast.success("تمت إضافة العنصر بنجاح");
      reset();
    },
  });
  console.log(existedData);
  const [excelData, setExcelData] = useState<ExistingItems[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<ExistedFormData>({
    resolver: zodResolver(ExistedSchema),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = event => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      setExcelData(jsonData as ExistingItems[]);
    };

    reader.readAsBinaryString(file);
  };

  const generateExcelTemplate = () => {
    const headers = [
      "السيريال",
      "الماركة",
      "الاسم",
      "الكمية الإجمالية",
      "الكمية المتبقية",
      "ملاحظات",
    ];

    const worksheet = XLSX.utils.json_to_sheet([], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج البيانات");
    XLSX.writeFile(workbook, "نموذج_العهدة.xlsx");
  };

  const onSubmit = (data: ExistedFormData) => {
    console.log("بيانات الفورم اليدوية", data);

    const formData = new FormData();

    formData.append("Name", data.Name);
    formData.append("ImageFile", data.ImageFile);
    formData.append("Brand", data.Brand);
    formData.append("Serial", data.Serial);
    formData.append("Quantity", data.Quantity);
    formData.append("QuantityEnum", data.QuantityEnum);
    formData.append("SqId", data.SqId);

    // Append Notes only if it exists
    if (data.Notes) {
      formData.append("Notes", data.Notes);
    }

    mutation.mutate(formData);
  };

  const handleExcelSubmit = () => {
    if (excelData.length === 0) return;

    console.log("بيانات الملف:", excelData);
    // sendDataToBackend(excelData);
  };
  return (
    <div className="p-0 w-full">
      <h1 className="text-2xl font-bold mb-2 flex items-center justify-between  p-1 ">
        <span className="text-blue-700 flex items-center gap-2">📦 صفحة العهدة</span>

        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition"
        >
          <FaArrowRight className="w-4 h-4" />
          رجوع
        </Link>
      </h1>
      {/* زر فتح/إغلاق الفورم */}
      <button
        type="button"
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="mb-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition cursor-pointer"
      >
        {isFormOpen ? "إخفاء الفورم" : "إظهار الفورم"}
      </button>

      {/* Form لإضافة عنصر جديد */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 shadow p-3 rounded-lg mb-2 border border-gray-200"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ValidationInput
              label="الاسم"
              name="Name"
              register={register}
              placeholder="ادخل الاسم"
              type="text"
              error={errors.Name?.message}
            />

            <ValidationInput
              label="الماركة"
              name="Brand"
              register={register}
              placeholder="ادخل الماركة"
              type="text"
              error={errors.Brand?.message}
            />

            <ValidationInput
              label="السيريال"
              name="Serial"
              register={register}
              placeholder="ادخل السيريال"
              type="text"
              error={errors.Serial?.message}
            />

            <ValidationInput
              label="الكمية"
              name="Quantity"
              register={register}
              placeholder="ادخل الكمية"
              type="text"
              error={errors.Quantity?.message}
            />

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">وحدة الكمية</label>
              <select
                {...register("QuantityEnum")}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option disabled value="">
                  اختر وحدة
                </option>
                <option value="UNIT">قطعة</option>
                <option value="METER">كيلو</option>
              </select>
              {errors.QuantityEnum && (
                <p className="text-red-500 text-sm mt-1">{errors.QuantityEnum.message}</p>
              )}
            </div>
            {/*
    <ValidationInput
      label="رقم التخزين"
      name="SqId"
      register={register}
      placeholder="ادخل رقم التخزين"
      type="text"
      error={errors.SqId?.message}
    /> */}
            <ValidationSelect
              label="اختر العنصر"
              name="SqId"
              register={register}
              options={existedData || []}
              error={errors.SqId?.message}
            />

            {/* Image Upload Old*/}
            {/* <div className="flex flex-col col-span-2">
      <label className="mb-1 text-sm font-medium text-gray-700">الصورة</label>
      <input
        type="file"
        accept="image/*"
        {...register("ImageFile")}
        className="p-2 border border-gray-300 rounded"
      />
      {errors.ImageFile && (
        <p className="text-red-500 text-sm mt-1">{errors.ImageFile.message}</p>
      )}
    </div> */}
            {/* New Image  */}
            <div className="flex flex-col col-span-2">
              <label className="mb-1 text-sm font-medium text-gray-700">الصورة</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  setValue("ImageFile", file as File, { shouldValidate: true });
                }}
                className="p-2 border border-gray-300 rounded"
              />
              {errors.ImageFile && (
                <p className="text-red-500 text-sm mt-1">{errors.ImageFile.message}</p>
              )}
            </div>
          </div>

          <ValidationInput
            label="ملاحظات"
            name="Notes"
            register={register}
            placeholder="ادخل الملاحظات (اختياري)"
            type="textarea"
            error={errors.Notes?.message}
          />

          {/* <div className="flex justify-center mt-4">
    <button
      type="submit"
      className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
    >
      إرسال
    </button>
  </div> */}

          <div className="mt-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              أو تحميل ملف Excel
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center mt-4 gap-4">
            <button
              type="submit"
              className="cursor-pointer w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              إضافة يدويًا
            </button>

            <button
              type="button"
              onClick={handleExcelSubmit}
              disabled={excelData.length === 0}
              className={`w-full md:w-auto px-6 py-2 rounded transition ${
                excelData.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "cursor-pointer bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              إرسال ملف Excel
            </button>

            <button
              type="button"
              onClick={generateExcelTemplate}
              className="cursor-pointer bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              تحميل نموذج Excel
            </button>
          </div>
        </form>
      )}

      {/* جدول عرض العهدة */}
      <InventoryTableHeader data={existedData ?? []} open={isFormOpen} />
    </div>
  );
}
