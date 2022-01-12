resource Image {
	permissions = ["read", "delete"];
	roles = ["Owner"];
	relations = { user: User };

	"read" if "Owner";
	"delete" if "Owner";

	"Owner" if "Owner" on "user";
}

has_relation(parent: User, "user", child: Image) if
	child.user = parent;
