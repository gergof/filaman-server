resource User {
	permissions = ["read", "modify", "delete"];
	roles = ["Owner"];

	"read" if "Owner";
	"modify" if "Owner";
	"delete" if "Owner";
}

has_role(actor: User, "Owner", resource: User) if
	actor.id = resource.id;
