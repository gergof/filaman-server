resource Spool {
	permissions = ["read", "modify", "delete"];
	roles = ["Owner"];
	relations = { user: User };

	"read" if "Owner";
	"modify" if "Owner";
	"delete" if "Owner";

	"Owner" if "Owner" on "user";
}

has_relation(parent: User, "user", child: Spool) if
	child.user = parent;
