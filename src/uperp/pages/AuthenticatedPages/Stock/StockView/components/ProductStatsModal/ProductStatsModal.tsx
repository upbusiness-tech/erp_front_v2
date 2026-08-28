import { PeriodSelector } from "@/application-components/PeriodSelector/PeriodSelector";
import type { ProductModel } from "@/model/product.model";
import { formatDateFromApi } from "@/uperp/common/dates";
import { extractStockFormatByProduct } from "@/uperp/common/formulas/productFormulas";
import { getProductSupplierNames } from "@/uperp/common/util/productConsts";
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Skeleton,
  Space,
  Statistic,
  Timeline,
  Typography,
} from "antd";
import { Calendar, FileText, Package, Tag, TrendingUp, User } from "lucide-react";
import { useProductStatsModalController } from "./useProductStatsModal.controller";

const { Text } = Typography;

type ProductStatsModalProps = {
  product: ProductModel | null;
  open: boolean;
  onClose: () => void;
};

export const ProductStatsModal = ({ product, open, onClose }: ProductStatsModalProps) => {
  const {
    period,
    handlePeriodChange,
    isLoading,
    getTransactionLabel,
    stats,
    productTransactionsData,
  } = useProductStatsModalController({ product });

  if (!product) return null;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Package size={18} />
          <span>Estatisticas do Produto</span>
        </Space>
      }
      onCancel={onClose}
      footer={null}
      width={720}
      style={{ top: 20 }}
      destroyOnHidden
    >
      {/* Cabecalho com info do produto */}
      <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item
          label={
            <Space>
              <FileText size={14} /> Produto
            </Space>
          }
        >
          <Text strong>{product.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <Tag size={14} /> Categoria
            </Space>
          }
        >
          <Space size={6}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: product.productCategory?.color,
                display: "inline-block",
              }}
            />
            {product.productCategory?.name}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Unidade de Medida">{product.unitOfMeasure}</Descriptions.Item>
        <Descriptions.Item label="Fornecedor">{getProductSupplierNames(product)}</Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <User size={14} /> Criado por
            </Space>
          }
        >
          {product.createByUser.employee.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <Calendar size={14} /> Data de Criacao
            </Space>
          }
        >
          {formatDateFromApi(product.createdAt ?? "")}
        </Descriptions.Item>
      </Descriptions>

      {/* Seletor de periodo */}
      <PeriodSelector period={period} onChange={handlePeriodChange} />

      {/* Cards de resumo */}
      <div style={{ opacity: isLoading && stats ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={12} md={8}>
            <Card size="small">
              {isLoading && !stats ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title="Quantidades Vendidas"
                  value={extractStockFormatByProduct(product, stats?.unitsSold ?? 0)}
                  prefix={<Package size={14} />}
                />
              )}
            </Card>
          </Col>
          <Col xs={12} md={8}>
            <Card size="small">
              {isLoading && !stats ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title="Retorno Bruto"
                  value={stats?.netProfit ?? 0}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: "#16A34A" }}
                />
              )}
            </Card>
          </Col>
          <Col xs={12} md={8}>
            <Card size="small">
              {isLoading && !stats ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title="Retorno Liquido"
                  value={stats?.grossProfit ?? 0}
                  precision={2}
                  prefix="R$"
                  valueStyle={{
                    color: (stats?.grossProfit ?? 0) >= 0 ? "#16A34A" : "#DC2626",
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Custo no periodo */}
      {/* <Card size="small" style={{ marginBottom: 16 }}>
        <Statistic
          title="Custo de Reposicao no Periodo"
          value={filteredCost}
          precision={2}
          prefix={<TrendingDown size={14} />}
          valueStyle={{ color: "#DC2626" }}
        />
      </Card> */}

      <Divider />

      {/* Timeline de transacoes */}
      <Text strong style={{ display: "block", marginBottom: 12 }}>
        <Space>
          <TrendingUp size={14} /> Timeline de Transacoes
        </Space>
      </Text>

      {productTransactionsData.length === 0 ? (
        <Text type="secondary">Nenhuma transacao encontrada no periodo selecionado.</Text>
      ) : (
        <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 8 }}>
          <Timeline
            items={productTransactionsData.map((t) => {
              const { label, color, description } = getTransactionLabel(t);
              return {
                color,
                children: (
                  <div style={{ marginBottom: 4 }}>
                    <Space>
                      <Text strong style={{ fontSize: 12 }}>
                        {formatDateFromApi(t.transactionDate)}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color,
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </Text>
                    </Space>
                    <div>
                      <Text style={{ fontSize: 13 }}>{description}</Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Por: {t.createdBy}
                      </Text>
                    </div>
                  </div>
                ),
              };
            })}
          />
        </div>
      )}
    </Modal>
  );
};
