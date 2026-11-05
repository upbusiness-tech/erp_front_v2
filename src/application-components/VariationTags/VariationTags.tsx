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
  const fontSize = size === "small" ? 11 : 13;

  return (
    <Space size={4} wrap={wrap}>
      {parts.size && (
        <Tag color="volcano-inverse" style={{ margin: 0, fontSize, fontWeight: "bold" }}>
          Tam. {parts.size}
        </Tag>
      )}
      {parts.color && (
        <Tag color="blue-inverse" style={{ margin: 0, fontSize, fontWeight: "bold" }}>
          {parts.color}
        </Tag>
      )}
      {parts.brand && (
        <Tag color="purple-inverse" style={{ margin: 0, fontSize, fontWeight: "bold" }}>
          {parts.brand}
        </Tag>
      )}
      {fallback && !parts.size && !parts.color && !parts.brand && (
        <Typography.Text type="secondary" style={{ fontSize, fontWeight: "bold" }}>
          {getVariationLabel(specification)}
        </Typography.Text>
      )}
    </Space>
  );
};
