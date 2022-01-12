import {
	Material,
	Image,
	Print,
	Printer,
	Spool,
	SpoolTemplate,
	User
} from '../models';

type Resource =
	| Image
	| Material
	| Print
	| Printer
	| Spool
	| SpoolTemplate
	| User;

export default Resource;
