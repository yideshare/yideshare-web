// import { useState } from "react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { cn } from "@/lib/frontend";

// interface DatePickerProps {
//   date: Date | null;
//   setDate: (date: Date) => void;
//   mounted: boolean;
//   label?: string;
//   required?: boolean;
//   showError?: boolean;
//   className?: string;
// }

// export default function DatePicker({
//   date,
//   setDate,
//   mounted,
//   label = "Date",
//   required = false,
//   showError = false,
//   className = "",
// }: DatePickerProps) {
//   const [showCalendar, setShowCalendar] = useState(false);
//   const isEmpty = date === null;
//   const shouldShowError = required && showError && isEmpty;

//   return (
//     <div className={cn("flex flex-col gap-1 relative", className)}>
//       <label className="text-sm font-medium">
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>

//       {mounted ? (
//         <>
//           <button
//             type="button"
//             onClick={() => setShowCalendar(!showCalendar)}
//             className={cn(
//               "border rounded-md p-2 w-full text-sm bg-muted/50 text-foreground text-left",
//               shouldShowError ? "border-red-500" : "border-input"
//             )}
//           >
//             {date ? format(date, "yyyy-MM-dd") : "Select a date"}
//           </button>

//           {shouldShowError && (
//             <p className="text-red-500 text-xs">This field is required</p>
//           )}
//         </>
//       ) : (
//         <div className="border rounded-md p-2 w-full text-sm bg-muted/50 text-foreground">
//           Loading...
//         </div>
//       )}

//       {showCalendar && mounted && (
//         <div className="absolute z-10 bg-white p-2 shadow-lg rounded-md top-full mt-1">
//           <DayPicker
//             mode="single"
//             selected={date}
//             onSelect={(selectedDate) => {
//               if (selectedDate) {
//                 setDate(selectedDate);
//               }
//               setShowCalendar(false);
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
