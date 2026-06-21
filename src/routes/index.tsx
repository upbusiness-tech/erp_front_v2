import { createFileRoute } from "@tanstack/react-router";
import { UpERPApp } from "../uperp/UpERPApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UpERP — ERP para comércios e varejos" },
      { name: "description", content: "Sistema ERP completo para gestão de vendas, estoque, clientes e finanças do seu comércio." },
      { property: "og:title", content: "UpERP — ERP para comércios e varejos" },
      { property: "og:description", content: "Sistema ERP completo para gestão de vendas, estoque, clientes e finanças do seu comércio." },
    ],
  }),
  component: UpERPApp,
});
