"use client"

import { useTheme } from "next-themes"
import {
  ToastContainer as ReactToastifyContainer,
  Bounce,
  type ToastContainerProps,
} from "react-toastify"

export function ToastContainer(props: ToastContainerProps) {
  const { resolvedTheme } = useTheme()

  return (
    <ReactToastifyContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      transition={Bounce}
      {...props}
    />
  )
}
