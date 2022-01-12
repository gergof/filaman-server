resource User {
	permissions = ["read", "modify", "delete", "create-material", "create-spooltemplate", "create-spool", "create-printer", "create-print"];
	roles = ["Owner"];

	"read" if "Owner";
	"modify" if "Owner";
	"delete" if "Owner";
	"create-material" if "Owner";
	"create-spooltemplate" if "Owner";
	"create-spool" if "Owner";
	"create-printer" if "Owner";
	"create-print" if "Owner";
}

has_role(actor: User, "Owner", resource: User) if
	actor.id = resource.id;
