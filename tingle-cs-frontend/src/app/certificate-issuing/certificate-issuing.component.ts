import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Certificate } from '../shared/certificate.model';
import { CertificatesService } from '../all-certificates/certificates.service';
import { EndEntityCertificate } from '../shared/end-entity-cert.model';
import { Extensions } from '../shared/extensions.model';
import { ExtensionsKeyUsage } from '../shared/key-usage.model';
import { ExtensionsBasicConstraints } from '../shared/basic-constraints.model';
import { ExtendedKeyUsage } from '../shared/extended-key-usage.model';

@Component({
  selector: 'app-certificate-issuing',
  templateUrl: './certificate-issuing.component.html',
  styleUrls: ['./certificate-issuing.component.css']
})
export class CertificateIssuingComponent implements OnInit {

  isLinear = true;
  spin = false;
  success = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  cas: Certificate[] = [];

  isSelfSigned = false;
  selectedCA: Certificate;
  selectedSubjectType: string;

  constructor(private _formBuilder: FormBuilder,
    private certificateService: CertificatesService) { }

  ngOnInit(): void {
    this.certificateService.getOnlyCA().subscribe(
      data => {
        // console.log(data)
        this.cas = data;
      },
      error => {
        console.log(error.error)
      }
    );
    this.firstFormGroup = this._formBuilder.group({
      CN: ['', Validators.required],
      OU: ['', Validators.required],
      ON: ['', Validators.required],
      LN: ['', Validators.required],
      ST: ['', Validators.required],
      CO: ['', Validators.required],
      E: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      ca: ['']
    });
    this.thirdFormGroup = this._formBuilder.group({
      criticalKeyUsage: [false],
      criticalBasicConstraints: [false],
      criticalExtendedKeyUsage: [false],
      digitalSignature: [false],
      keyEncipherment: [false],
      nonRepudiation: [false],
      dataEncipherment: [false],
      keyAgreement: [false],
      keyCertSign: [false],
      crlSign: [false],
      encipherOnly: [false],
      decipherOnly: [false],
      clientAuth: [false],
      codeSigning: [false],
      emailProtection: [false],
      ocspSigning: [false],
      serverAuth: [false],
      timeStamping: [false],
      subjectType: ['', Validators.required],
      password: [''],
      alias: ['']
    });

  }

  onNext1Click() {
    // add some checking if needed
  }


  onCASelected(ca: Certificate) {
    this.selectedCA = ca;
  }

  onSubjectTypeClick(type: string) {
    this.selectedSubjectType = type;
  }

  onDoneClick() {
    //========== Take values from forms and construct a Certificate object ==========
    const alias = this.thirdFormGroup.value.alias;
    const active = true;

    var role = '';
    if (this.isSelfSigned) {
      role = 'ROOT';
    } else if (this.thirdFormGroup.value.subjectType === 'CA') {
      role = 'INTERMEDIATE'
    } else {
      role = 'END_ENTITY'
    }

    const cn = this.firstFormGroup.value.CN;
    const o = this.firstFormGroup.value.ON;
    const l = this.firstFormGroup.value.LN;
    const st = this.firstFormGroup.value.ST;
    const c = this.firstFormGroup.value.CO;
    const ou = this.firstFormGroup.value.OU;
    const e = this.firstFormGroup.value.E;

    // Make request based on certificate role
    if (role === 'ROOT') {
      const newCert = new Certificate(null, null, alias, true, role, cn, o, l, st, c, e, ou);
      newCert.extensions = this.attachExtensions();

      //CHECK 
      console.log(newCert)

      this.makeRootRequest(newCert);
    } else if (role === 'INTERMEDIATE') {
      // set serial number to issuer.serialNumber
      const newCert = new Certificate(null, null, alias, true, role, cn, o, l, st, c, e, ou);
      newCert.extensions = this.attachExtensions();
      newCert.serialNumber = this.selectedCA.serialNumber;

      //CHECK 
      console.log(newCert)

      this.makeCARequest(newCert);
    } else {
      const cert = new Certificate(null, null, alias, active, role, cn, o, l, st, c, e, ou);
      cert.extensions = this.attachExtensions();
      const issuer = this.selectedCA;
      const endEntityCert: EndEntityCertificate = new EndEntityCertificate(cert, issuer);
      this.makeEndEntityRequest(endEntityCert);
    }

  }

  // Self-Signed slider click ([checked]="isSelfSigned")
  sliderClick() {
    this.isSelfSigned = !this.isSelfSigned;
    if (this.isSelfSigned) {
      this.thirdFormGroup.value.subjectType = "CA"
    }
  }


  makeEndEntityRequest(endEntityCert: any) {
    this.spin = true;
    this.certificateService.makeNewEndEntity(endEntityCert).subscribe(
      data => {
        this.spin = false;
        this.success = true;
        console.log(data);
      },
      error => {
        this.spin = false;
        console.log(error)
      }
    )
  }

  makeRootRequest(cert: Certificate) {
    this.spin = true;
    this.certificateService.makeNewRoot(cert).subscribe(
      data => {
        this.spin = false;
        this.success = true;
        console.log(data);
      },
      error => {
        this.spin = false;
        console.log(error)
      }
    );
  }

  makeCARequest(cert: Certificate) {
    this.spin = true;
    this.certificateService.makeNewCA(cert).subscribe(
      data => {
        this.spin = false;
        this.success = true;
        console.log(data);
      },
      error => {
        this.spin = false;
        console.log(error)
      }
    );
  }

  attachExtensions(): Extensions {

    var extensions: Extensions = new Extensions();
    var keyUsage: ExtensionsKeyUsage = new ExtensionsKeyUsage();
    var basicConstraints: ExtensionsBasicConstraints = new ExtensionsBasicConstraints();
    var extendedKeyUsage: ExtendedKeyUsage = new ExtendedKeyUsage();

    // Attach key usages
    keyUsage.digitalSignature = this.thirdFormGroup.value.digitalSignature;
    keyUsage.nonRepudation = this.thirdFormGroup.value.nonRepudiation;
    keyUsage.keyEncipherment = this.thirdFormGroup.value.keyEncipherment;
    keyUsage.dataEncipherment = this.thirdFormGroup.value.dataEncipherment;
    keyUsage.keyAgreement = this.thirdFormGroup.value.keyAgreement;
    keyUsage.keyCertSign = this.thirdFormGroup.value.keyCertSign;
    keyUsage.crlSign = this.thirdFormGroup.value.crlSign;
    keyUsage.encipherOnly = this.thirdFormGroup.value.encipherOnly;
    keyUsage.decipherOnly = this.thirdFormGroup.value.decipherOnly;
    keyUsage.critical = this.thirdFormGroup.value.criticalKeyUsage;
    extensions.keyUsage = keyUsage;

    // Attach basic constraints
    if (this.isSelfSigned || this.thirdFormGroup.value.subjectType === "CA") {
      basicConstraints.certificateAuthority = true;
    } else {
      basicConstraints.certificateAuthority = false;
    }
    basicConstraints.critical = this.thirdFormGroup.value.criticalBasicConstraints;
    extensions.basicConstraints = basicConstraints;

    // Attach Extended Key Usage in case of end-entity cert
    if (this.selectedSubjectType === 'end-entity') {
      console.log('END-ENTITY !!!')
      extendedKeyUsage.critical = this.thirdFormGroup.value.criticalExtendedKeyUsage;
      extendedKeyUsage.clientAuth = this.thirdFormGroup.value.clientAuth;
      extendedKeyUsage.codeSigning = this.thirdFormGroup.value.codeSigning;
      extendedKeyUsage.emailProtection = this.thirdFormGroup.value.emailProtection;
      extendedKeyUsage.ocspSigning = this.thirdFormGroup.value.ocspSigning;
      extendedKeyUsage.serverAuth = this.thirdFormGroup.value.serverAuth;
      extendedKeyUsage.timeStamping = this.thirdFormGroup.value.timeStamping;

      extensions.extendedKeyUsage = extendedKeyUsage;
    }

    console.log(extensions)

    return extensions;
  }


}
