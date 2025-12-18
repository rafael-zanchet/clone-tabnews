exports.up = (pgm) => {
  pgm.createTable("farms", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    farm_name: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    user_id: {
      type: "varchar(254)",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
  });
};
