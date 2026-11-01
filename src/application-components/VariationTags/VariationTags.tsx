import { Space, Tag, Typography } from "antd";
import {
  getVariationLabel,
  getVariationParts,
  VariationLike,
} from "@/uperp/common/util/productVariation";

type VariationTagsProps = {
  specification: VariationLike;
  size?: "small" | "default";
  wrap?: boolean;
  fallback?: boolean;
};

export const VariationTags = ({
  specification,
  size = "default",
  wrap = true,
  fallback = true,
}: VariationTagsProps) => {
  const parts = getVariationParts(specification);
  const fontSize = size === "small" ? 11 : 12;

  return (
    <Space size={4} wrap={wrap}>
      {parts.size && (
        <Tag color="orange" style={{ margin: 0, fontSize }}>
          Tam. {parts.size}
        </Tag>
      )}
      {parts.color && (
        <Tag color="green" style={{ margin: 0, fontSize }}>
          {parts.color}
        </Tag>
      )}
      {parts.brand && (
        <Tag color="purple" style={{ margin: 0, fontSize }}>
          {parts.brand}
        </Tag>
      )}
      {fallback && !parts.size && !parts.color && !parts.brand && (
        <Typography.Text type="secondary" style={{ fontSize }}>
          {getVariationLabel(specification)}
        </Typography.Text>
      )}
    </Space>
  );
};
