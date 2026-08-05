import { PAYMENT_LABEL } from "@/uperp/types";
import { Button, Divider, List, message, Modal, Row, Space, Tag, Typography } from "antd";
import { CheckCircle2, CreditCard, Printer } from "lucide-react";

const { Title, Text } = Typography;

type SaleReceiptModalProps = {
  receiptSale: null;
  onClose: () => void;
};

export const SaleReceiptModal = ({ receiptSale, onClose }: SaleReceiptModalProps) => {
  const customers = [];

  return (
    <></>
    // <Modal
    //   open={receiptSale !== null}
    //   title={
    //     receiptSale ? (
    //       <Space>
    //         <CheckCircle2 size={18} color="#16A34A" />
    //         Venda {receiptSale.id}
    //       </Space>
    //     ) : (
    //       ""
    //     )
    //   }
    //   onCancel={onClose}
    //   footer={
    //     receiptSale && (
    //       <Space>
    //         <Button onClick={onClose}>Fechar</Button>
    //         <Button
    //           type="primary"
    //           icon={<Printer size={14} />}
    //           onClick={() => {
    //             message.success(`Cupom da venda ${receiptSale.id} enviado para impressão`);
    //           }}
    //         >
    //           Reimprimir cupom
    //         </Button>
    //       </Space>
    //     )
    //   }
    //   width={560}
    //   destroyOnHidden
    // >
    //   {receiptSale && (
    //     <div>
    //       <Row justify="space-between" style={{ marginBottom: 4 }}>
    //         <Text type="secondary">Data</Text>
    //         <Text>{receiptSale.date}</Text>
    //       </Row>
    //       <Row justify="space-between" style={{ marginBottom: 4 }}>
    //         <Text type="secondary">Tipo</Text>
    //         <Tag color={receiptSale.type === "balcao" ? "orange" : "blue"} style={{ margin: 0 }}>
    //           {receiptSale.type === "balcao" ? "Balcão" : "Serviço"}
    //         </Tag>
    //       </Row>
    //       <Row justify="space-between" style={{ marginBottom: 4 }}>
    //         <Text type="secondary">Cliente</Text>
    //         <Text>
    //           {customers.find((c) => c.id === receiptSale.customerId)?.name || "Consumidor"}
    //         </Text>
    //       </Row>

    //       <Divider style={{ margin: "12px 0" }}>Itens</Divider>
    //       {receiptSale.lines?.length ? (
    //         <List
    //           size="small"
    //           dataSource={receiptSale.lines}
    //           renderItem={(l) => (
    //             <List.Item>
    //               <List.Item.Meta
    //                 title={
    //                   <Space>
    //                     <Text strong>{l.name}</Text>
    //                     {l.size && (
    //                       <Tag color="orange" style={{ margin: 0 }}>
    //                         Tam. {l.size}
    //                       </Tag>
    //                     )}
    //                     {l.color && <Tag style={{ margin: 0 }}>{l.color}</Tag>}
    //                   </Space>
    //                 }
    //                 description={
    //                   <Space direction="vertical" size={0}>
    //                     <Text type="secondary" style={{ fontSize: 12 }}>
    //                       {l.qty} × R$ {l.unitPrice.toFixed(2)}
    //                       {l.sku ? ` · ${l.sku}` : ""}
    //                     </Text>
    //                     {l.observation && (
    //                       <Text italic type="secondary" style={{ fontSize: 11 }}>
    //                         "{l.observation}"
    //                       </Text>
    //                     )}
    //                   </Space>
    //                 }
    //               />
    //               <Text strong>R$ {(l.qty * l.unitPrice).toFixed(2)}</Text>
    //             </List.Item>
    //           )}
    //         />
    //       ) : (
    //         <Text type="secondary">{receiptSale.items} item(ns) — detalhamento não disponível</Text>
    //       )}

    //       <Divider style={{ margin: "12px 0" }}>Pagamento</Divider>
    //       {receiptSale.payments?.length ? (
    //         <List
    //           size="small"
    //           dataSource={receiptSale.payments}
    //           renderItem={(p) => (
    //             <List.Item>
    //               <Space>
    //                 <CreditCard size={14} color="#F26B1F" />
    //                 <Text>{PAYMENT_LABEL[p.method]}</Text>
    //               </Space>
    //               <Text strong>R$ {p.value.toFixed(2)}</Text>
    //             </List.Item>
    //           )}
    //         />
    //       ) : (
    //         <Text type="secondary">Sem detalhamento de pagamento</Text>
    //       )}

    //       {receiptSale.discount ? (
    //         <Row justify="space-between" style={{ marginTop: 8 }}>
    //           <Text type="secondary">Desconto</Text>
    //           <Text type="secondary">- R$ {receiptSale.discount.toFixed(2)}</Text>
    //         </Row>
    //       ) : null}
    //       <Row justify="space-between" style={{ marginTop: 8 }}>
    //         <Title level={4} style={{ margin: 0 }}>
    //           Total
    //         </Title>
    //         <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
    //           R$ {receiptSale.total.toFixed(2)}
    //         </Title>
    //       </Row>
    //     </div>
    //   )}
    // </Modal>
  );
};
