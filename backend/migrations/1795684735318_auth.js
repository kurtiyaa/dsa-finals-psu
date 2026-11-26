export const shorthands = undefined;

export const up = (pgm) => {
    pgm.createTable("users", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        email: { type: "text", notNull: true, unique: true },
        password_hash: { type: "text", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    });

    pgm.createTable("sessions", {
        id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
        user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
        token_hash: { type: "text", notNull: true, unique: true },
        expires_at: { type: "timestamptz", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    });

    pgm.createIndex("sessions", "user_id");
};

export const down = (pgm) => {
    pgm.dropTable("sessions");
    pgm.dropTable("users");
};
